import type {
  InvitationPageData,
  InvitationListItem,
} from "./types";

function daysFromNow(
  days: number,
) {
  const date = new Date();

  date.setDate(
    date.getDate() + days,
  );

  return date.toISOString();
}

function daysAgo(
  days: number,
) {
  const date = new Date();

  date.setDate(
    date.getDate() - days,
  );

  return date.toISOString();
}

const mockInvitations: InvitationListItem[] =
  [
    {
      id: "inv-1001",
      email:
        "venkysp257@gmail.com",
      name: "Test Member 2",
      roleKey: "MEMBER",
      roleName: "Member",
      status: "PENDING",
      createdAt:
        daysAgo(1),
      expiresAt:
        daysFromNow(6),
      lastSentAt:
        daysAgo(1),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 1,
    },

    {
      id: "inv-1002",
      email:
        "ananya.shah@example.com",
      name: "Ananya Shah",
      roleKey: "MANAGER",
      roleName: "Manager",
      status: "PENDING",
      createdAt:
        daysAgo(2),
      expiresAt:
        daysFromNow(5),
      lastSentAt:
        daysAgo(1),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 2,
    },

    {
      id: "inv-1003",
      email:
        "rahul.verma@example.com",
      name: "Rahul Verma",
      roleKey: "ADMIN",
      roleName:
        "Administrator",
      status: "PENDING",
      createdAt:
        daysAgo(3),
      expiresAt:
        daysFromNow(4),
      lastSentAt:
        daysAgo(3),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 1,
    },

    {
      id: "inv-1004",
      email:
        "meera.nair@example.com",
      name: "Meera Nair",
      roleKey: "MEMBER",
      roleName: "Member",
      status: "ACCEPTED",
      createdAt:
        daysAgo(12),
      expiresAt:
        daysAgo(5),
      lastSentAt:
        daysAgo(12),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 1,
    },

    {
      id: "inv-1005",
      email:
        "arjun.kumar@example.com",
      name: "Arjun Kumar",
      roleKey: "MEMBER",
      roleName: "Member",
      status: "ACCEPTED",
      createdAt:
        daysAgo(18),
      expiresAt:
        daysAgo(11),
      lastSentAt:
        daysAgo(18),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 1,
    },

    {
      id: "inv-1006",
      email:
        "sneha.reddy@example.com",
      name: "Sneha Reddy",
      roleKey: "MANAGER",
      roleName: "Manager",
      status: "EXPIRED",
      createdAt:
        daysAgo(10),
      expiresAt:
        daysAgo(3),
      lastSentAt:
        daysAgo(10),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 1,
    },

    {
      id: "inv-1007",
      email:
        "kiran.patel@example.com",
      name: "Kiran Patel",
      roleKey: "MEMBER",
      roleName: "Member",
      status: "REVOKED",
      createdAt:
        daysAgo(15),
      expiresAt:
        daysAgo(8),
      lastSentAt:
        daysAgo(15),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 1,
    },

    {
      id: "inv-1008",
      email:
        "pooja.menon@example.com",
      name: "Pooja Menon",
      roleKey: "ADMIN",
      roleName:
        "Administrator",
      status: "ACCEPTED",
      createdAt:
        daysAgo(20),
      expiresAt:
        daysAgo(13),
      lastSentAt:
        daysAgo(20),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 1,
    },

    {
      id: "inv-1009",
      email:
        "vikas.joshi@example.com",
      name: "Vikas Joshi",
      roleKey: "OWNER",
      roleName: "Owner",
      status: "PENDING",
      createdAt:
        daysAgo(0),
      expiresAt:
        daysFromNow(7),
      lastSentAt:
        daysAgo(0),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 1,
    },

    {
      id: "inv-1010",
      email:
        "divya.rao@example.com",
      name: "Divya Rao",
      roleKey: "MEMBER",
      roleName: "Member",
      status: "PENDING",
      createdAt:
        daysAgo(4),
      expiresAt:
        daysFromNow(3),
      lastSentAt:
        daysAgo(2),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 3,
    },

    {
      id: "inv-1011",
      email:
        "sanjay.iyer@example.com",
      name: "Sanjay Iyer",
      roleKey: "MANAGER",
      roleName: "Manager",
      status: "EXPIRED",
      createdAt:
        daysAgo(21),
      expiresAt:
        daysAgo(14),
      lastSentAt:
        daysAgo(21),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 1,
    },

    {
      id: "inv-1012",
      email:
        "nidhi.gupta@example.com",
      name: "Nidhi Gupta",
      roleKey: "MEMBER",
      roleName: "Member",
      status: "ACCEPTED",
      createdAt:
        daysAgo(30),
      expiresAt:
        daysAgo(23),
      lastSentAt:
        daysAgo(30),
      invitedByName:
        "Venkatesh Vishwanadula",
      sendCount: 1,
    },
  ];

export function createMockInvitationData(
  organizationName = "Hello",
  organizationId =
    "11ab5fcd-fbc6-473f-9935-4ee836be41c5",
): InvitationPageData {
  return {
    organization: {
      id: organizationId,
      name: organizationName,
    },

    invitations:
      mockInvitations.map(
        (invitation) => ({
          ...invitation,
        }),
      ),
  };
}