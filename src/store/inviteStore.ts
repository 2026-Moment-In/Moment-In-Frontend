import { create } from "zustand";
import type { Invitation, RSVPEntry, GuestMessage, CoupleInfo, InvitationCover, ColorTheme, LocationInfo, NoticeItem, NearbyItem } from "../types";
import { mockInvitation } from "../demo";
interface InviteState {
  invitation: Invitation | null;
  createInvitation: (data: { couple: CoupleInfo; cover: InvitationCover; colorTheme: ColorTheme; location?: LocationInfo; noticeItems?: NoticeItem[]; noticeTitle?: string; nearbyItems?: NearbyItem[]; nearbyTitle?: string; nearbySubtitle?: string; msgTitle?: string }) => string;
  addRSVP: (entry: Omit<RSVPEntry, "id" | "createdAt">) => void;
  addMessage: (msg: Omit<GuestMessage, "id" | "createdAt">) => void;
  deleteMessage: (id: string) => void;
  deleteRSVP: (id: string) => void;
  incrementViewCount: () => void;
}

export const useInviteStore = create<InviteState>((set) => ({
  invitation: mockInvitation,

  createInvitation: ({ couple, cover, colorTheme, location, noticeItems, noticeTitle, nearbyItems, nearbyTitle, nearbySubtitle, msgTitle }) => {
    const code = "WEDDING" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const inv: Invitation = {
      id: `inv-${Date.now()}`,
      entryCode: code,
      couple,
      cover,
      colorTheme,
      gallery: [],
      rsvpList: [],
      messages: [],
      viewCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      location,
      noticeItems,
      noticeTitle,
      nearbyItems,
      nearbyTitle,
      nearbySubtitle,
      msgTitle,
    };
    set({ invitation: inv });
    return code;
  },

  addRSVP: (entry) =>
    set((state) => {
      if (!state.invitation) return state;
      return {
        invitation: {
          ...state.invitation,
          rsvpList: [
            ...state.invitation.rsvpList,
            { ...entry, id: `r-${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] },
          ],
        },
      };
    }),

  addMessage: (msg) =>
    set((state) => {
      if (!state.invitation) return state;
      return {
        invitation: {
          ...state.invitation,
          messages: [
            { ...msg, id: `m-${Date.now()}`, createdAt: new Date().toISOString().replace("T", " ").slice(0, 19) },
            ...state.invitation.messages,
          ],
        },
      };
    }),

  deleteMessage: (id) =>
    set((state) => {
      if (!state.invitation) return state;
      return {
        invitation: {
          ...state.invitation,
          messages: state.invitation.messages.filter((m) => m.id !== id),
        },
      };
    }),

  deleteRSVP: (id) =>
    set((state) => {
      if (!state.invitation) return state;
      return {
        invitation: {
          ...state.invitation,
          rsvpList: state.invitation.rsvpList.filter((r) => r.id !== id),
        },
      };
    }),

  incrementViewCount: () =>
    set((state) => {
      if (!state.invitation) return state;
      return { invitation: { ...state.invitation, viewCount: state.invitation.viewCount + 1 } };
    }),
}));
