"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import type {
  ImportInvitationInput,
  ImportInvitationValidationResult,
  InvitationRoleKey,
} from "@/lib/invitations/types";

import {
  INVITATION_TEMPLATE_COLUMNS,
  MAX_IMPORT_FILE_SIZE,
  MAX_IMPORT_ROWS,
  downloadInvitationTemplate,
  getInvitableRoleKeys,
  getRoleLabel,
  validateInvitationCsv,
} from "@/lib/invitations/utils";

type Props = {
  open: boolean;
  actorRole: InvitationRoleKey;
  existingEmails: string[];
  onClose: () => void;
  onImport: (
    invitations: ImportInvitationInput[],
  ) => Promise<void> | void;
};

type PreviewRow = {
  id: string;
  line: number;
  email: string;
  name: string;
  role: string;
  status: "VALID" | "INVALID";
  reason: string;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to read the selected file.";
}

function getInvalidRowValues(
  values: string[],
) {
  return {
    email: values[0] ?? "",
    name: values[1] ?? "",
    role: values[2] ?? "",
  };
}

function buildPreviewRows(
  validation: ImportInvitationValidationResult,
): PreviewRow[] {
  const validRows: PreviewRow[] =
    validation.valid.map(
      (invitation, index) => ({
        id: `valid-${index}-${invitation.email}`,
        line: index + 2,
        email: invitation.email,
        name: invitation.name,
        role: invitation.roleKey,
        status: "VALID",
        reason: "Ready to import",
      }),
    );

  const invalidRows: PreviewRow[] =
    validation.invalid.map(
      (rowError) => {
        const values =
          getInvalidRowValues(
            rowError.values,
          );

        return {
          id: `invalid-${rowError.line}`,
          line: rowError.line,
          email: values.email,
          name: values.name,
          role: values.role,
          status: "INVALID",
          reason: rowError.reason,
        };
      },
    );

  /*
   * The current validation result does not
   * retain the original source line for valid
   * rows. We therefore use the valid-row index
   * for their display line and then sort the
   * preview numerically.
   */
  return [
    ...validRows,
    ...invalidRows,
  ].sort(
    (a, b) => a.line - b.line,
  );
}

export function InvitationImportDialog({
  open,
  actorRole,
  existingEmails,
  onClose,
  onImport,
}: Props) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const onCloseRef =
    useRef(onClose);

  const isSubmittingRef =
    useRef(false);

  const readRequestRef =
    useRef(0);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [validation, setValidation] =
    useState<ImportInvitationValidationResult | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(null);

  const [isReading, setIsReading] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  onCloseRef.current = onClose;
  isSubmittingRef.current = isSubmitting;

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setValidation(null);
      setError(null);
      setIsReading(false);
      setIsSubmitting(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedFile(null);
    setValidation(null);
    setError(null);
    setIsReading(false);
    setIsSubmitting(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !isSubmittingRef.current
      ) {
        onCloseRef.current();
      }
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const allowedRoles =
    getInvitableRoleKeys(actorRole);

  const allowedRoleLabels =
    allowedRoles.map(getRoleLabel);

  const previewRows =
    validation
      ? buildPreviewRows(validation)
      : [];

  const validCount =
    validation?.valid.length ?? 0;

  const invalidCount =
    validation?.invalid.length ?? 0;

  const totalRows =
    validCount + invalidCount;

  const isImportDisabled =
    isReading ||
    isSubmitting ||
    validCount === 0;

  function handleClose() {
    if (isReading || isSubmitting) {
      return;
    }

    readRequestRef.current += 1;

    setSelectedFile(null);
    setValidation(null);
    setError(null);
    setIsReading(false);
    setIsSubmitting(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onClose();
  }

  function handleChooseFile() {
    if (isReading || isSubmitting) {
      return;
    }

    fileInputRef.current?.click();
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    /*
     * Allows selecting the same file again.
     */
    event.target.value = "";

    if (!file) {
      return;
    }

    const requestId =
      ++readRequestRef.current;

    setError(null);
    setValidation(null);
    setSelectedFile(null);

    const isCsv =
      file.name
        .toLowerCase()
        .endsWith(".csv");

    if (!isCsv) {
      setError(
        "Please select a CSV file.",
      );
      return;
    }

    if (
      file.size >
      MAX_IMPORT_FILE_SIZE
    ) {
      setError(
        `The selected file is too large. Maximum file size is ${formatFileSize(
          MAX_IMPORT_FILE_SIZE,
        )}.`,
      );
      return;
    }

    setSelectedFile(file);
    setIsReading(true);

    try {
      const text =
        await file.text();

      /*
       * Ignore stale async results when the
       * user selects another file.
       */
      if (
        requestId !==
        readRequestRef.current
      ) {
        return;
      }

      const result =
        validateInvitationCsv(
          text,
          actorRole,
          existingEmails,
        );

      if (
        requestId !==
        readRequestRef.current
      ) {
        return;
      }

      setValidation(result);

      if (
        result.valid.length === 0 &&
        result.invalid.length === 0
      ) {
        setError(
          "The CSV does not contain any invitation rows.",
        );
      }
    } catch (caughtError) {
      if (
        requestId !==
        readRequestRef.current
      ) {
        return;
      }

      setValidation(null);

      setError(
        getErrorMessage(caughtError),
      );
    } finally {
      if (
        requestId ===
        readRequestRef.current
      ) {
        setIsReading(false);
      }
    }
  }

  async function handleImport() {
    if (
      isImportDisabled ||
      !validation ||
      validation.valid.length === 0
    ) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onImport(
        validation.valid,
      );

      handleClose();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to import the invitations.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isReading &&
          !isSubmitting
        ) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invitation-import-dialog-title"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-6 border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="invitation-import-dialog-title"
              className="text-base font-semibold text-slate-950"
            >
              Import invitations
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Upload a CSV file and review
              every row before importing.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            disabled={
              isReading ||
              isSubmitting
            }
            onClick={handleClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 px-6 py-6">
            {/* CSV instructions */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    CSV format
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Use these columns in this
                    exact order:
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {INVITATION_TEMPLATE_COLUMNS.map(
                      (column) => (
                        <span
                          key={column}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                        >
                          {column}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    isReading ||
                    isSubmitting
                  }
                  onClick={
                    downloadInvitationTemplate
                  }
                  className="shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Download template
                </button>
              </div>

              <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:grid-cols-3">
                <div>
                  <span className="font-semibold text-slate-700">
                    Maximum rows
                  </span>

                  <p className="mt-1">
                    {MAX_IMPORT_ROWS}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">
                    Maximum file size
                  </span>

                  <p className="mt-1">
                    {formatFileSize(
                      MAX_IMPORT_FILE_SIZE,
                    )}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">
                    Allowed roles
                  </span>

                  <p className="mt-1 leading-5">
                    {allowedRoleLabels.length
                      ? allowedRoleLabels.join(
                          ", ",
                        )
                      : "None"}
                  </p>
                </div>
              </div>
            </div>

            {/* File input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={
                handleFileChange
              }
            />

            {/* File picker */}
            {!selectedFile ? (
              <button
                type="button"
                disabled={
                  isReading ||
                  isSubmitting
                }
                onClick={
                  handleChooseFile
                }
                className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16V4m0 0-4 4m4-4 4 4M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15"
                    />
                  </svg>
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-900">
                  Choose a CSV file
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Upload your completed invitation
                  template.
                </p>

                <span className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
                  Select file
                </span>
              </button>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3h7.5L19 7.75V21H6.75A1.75 1.75 0 0 1 5 19.25V4.75A1.75 1.75 0 0 1 6.75 3Z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14 3v5h5M8.5 13h7M8.5 16.5h7"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {selectedFile.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatFileSize(
                          selectedFile.size,
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={
                      isReading ||
                      isSubmitting
                    }
                    onClick={
                      handleChooseFile
                    }
                    className="shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Change file
                  </button>
                </div>
              </div>
            )}

            {/* Reading state */}
            {isReading && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Reading and validating file...
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Please wait.
                  </p>
                </div>
              </div>
            )}

            {/* General file error only */}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-red-800">
                  Unable to process file
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Unified preview table */}
            {validation &&
              !isReading && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {/* Summary */}
                  <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Import preview
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Review the status and reason for
                        each row before importing.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
                        {validCount} valid
                      </span>

                      <span className="rounded-lg bg-red-50 px-2.5 py-1.5 text-red-700">
                        {invalidCount} invalid
                      </span>

                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-600">
                        {totalRows} total
                      </span>
                    </div>
                  </div>

                  {/* Table */}
                  {previewRows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left">
                        <thead className="border-b border-slate-100 bg-slate-50">
                          <tr>
                            <th className="w-16 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Line
                            </th>

                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Email
                            </th>

                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Name
                            </th>

                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Role
                            </th>

                            <th className="w-28 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Status
                            </th>

                            <th className="min-w-[260px] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Reason
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {previewRows.map(
                            (row) => (
                              <tr
                                key={row.id}
                                className={
                                  row.status ===
                                  "INVALID"
                                    ? "bg-red-50/30"
                                    : "bg-white"
                                }
                              >
                                <td className="px-4 py-3 align-top text-xs font-medium tabular-nums text-slate-500">
                                  {row.line}
                                </td>

                                <td className="px-4 py-3 align-top">
                                  <p
                                    className={
                                      row.email
                                        ? "text-sm text-slate-700"
                                        : "text-sm italic text-slate-400"
                                    }
                                  >
                                    {row.email ||
                                      "Empty"}
                                  </p>
                                </td>

                                <td className="px-4 py-3 align-top">
                                  <p
                                    className={
                                      row.name
                                        ? "text-sm text-slate-700"
                                        : "text-sm italic text-slate-400"
                                    }
                                  >
                                    {row.name ||
                                      "Empty"}
                                  </p>
                                </td>

                                <td className="px-4 py-3 align-top">
                                  <p
                                    className={
                                      row.role
                                        ? "text-sm text-slate-700"
                                        : "text-sm italic text-slate-400"
                                    }
                                  >
                                    {row.role
                                      ? getRoleLabel(
                                          row.role as InvitationRoleKey,
                                        )
                                      : "Empty"}
                                  </p>
                                </td>

                                <td className="px-4 py-3 align-top">
                                  {row.status ===
                                  "VALID" ? (
                                    <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                      Valid
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                      Invalid
                                    </span>
                                  )}
                                </td>

                                <td className="px-4 py-3 align-top">
                                  <p
                                    className={
                                      row.status ===
                                      "VALID"
                                        ? "text-sm text-emerald-700"
                                        : "text-sm font-medium text-red-700"
                                    }
                                  >
                                    {row.reason}
                                  </p>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-slate-600">
                        No invitation rows were found.
                      </p>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs leading-5 text-slate-500">
            {validation ? (
              <>
                {validCount} of {totalRows} rows are
                ready to import.
              </>
            ) : (
              <>
                Only valid rows will be imported.
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={
                isReading ||
                isSubmitting
              }
              onClick={handleClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                isImportDisabled
              }
              onClick={
                handleImport
              }
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting
                ? "Importing..."
                : `Import ${validCount > 0 ? validCount : ""} invitations`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}