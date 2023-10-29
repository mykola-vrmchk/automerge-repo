import { DocumentId, PeerId, SessionId } from "../types.js"

/**
 * A sync message for a particular document
 */
export type SyncMessage = {
  type: "sync"

  /** The peer ID of the sender of this message */
  senderId: PeerId

  /** The peer ID of the recipient of this message */
  targetId: PeerId

  /** The automerge sync message */
  data: Uint8Array

  /** The document ID of the document this message is for */
  documentId: DocumentId
}

/** An ephemeral message
 *
 * @remarks
 * Ephemeral messages are not persisted anywhere and have no particular
 * structure. `automerge-repo` will gossip them around, in order to avoid
 * eternal loops of ephemeral messages every message has a session ID, which
 * is a random number generated by the sender at startup time, and a sequence
 * number. The combination of these two things allows us to discard messages
 * we have already seen.
 * */
export type EphemeralMessage = {
  type: "ephemeral"

  /** The peer ID of the sender of this message */
  senderId: PeerId

  /** The peer ID of the recipient of this message */
  targetId: PeerId

  /** A sequence number which must be incremented for each message sent by this peer */
  count: number

  /** The ID of the session this message is part of. The sequence number for a given session always increases */
  sessionId: SessionId

  /** The document ID this message pertains to */
  documentId: DocumentId

  /** The actual data of the message */
  data: Uint8Array
}

/** Sent by a {@link Repo} to indicate that it does not have the document and none of it's connected peers do either */
export type DocumentUnavailableMessage = {
  type: "doc-unavailable"

  /** The peer ID of the sender of this message */
  senderId: PeerId

  /** The peer ID of the recipient of this message */
  targetId: PeerId

  /** The document which the peer claims it doesn't have */
  documentId: DocumentId
}

/** Sent by a {@link Repo} to request a document from a peer
 *
 * @remarks
 * This is identical to a {@link SyncMessage} except that it is sent by a {@link Repo}
 * as the initial sync message when asking the other peer if it has the document.
 * */
export type RequestMessage = {
  type: "request"

  /** The peer ID of the sender of this message */
  senderId: PeerId

  /** The peer ID of the recipient of this message */
  targetId: PeerId

  /** The initial automerge sync message */
  data: Uint8Array

  /** The document ID this message requests */
  documentId: DocumentId
}

/** (anticipating work in progress) */
export type AuthMessage<TPayload = any> = {
  type: "auth"

  /** The peer ID of the sender of this message */
  senderId: PeerId

  /** The peer ID of the recipient of this message */
  targetId: PeerId

  /** The payload of the auth message (up to the specific auth provider) */
  payload: TPayload
}

/** These are message types that a {@link NetworkAdapter} surfaces to a {@link Repo}. */
export type RepoMessage =
  | SyncMessage
  | EphemeralMessage
  | RequestMessage
  | DocumentUnavailableMessage

/** These are all the message types that a {@link NetworkAdapter} might see. */
export type Message = RepoMessage | AuthMessage

/**
 * The contents of a message, without the sender ID or other properties added by the {@link NetworkSubsystem})
 */
export type MessageContents<T extends Message = Message> =
  T extends EphemeralMessage
    ? Omit<T, "senderId" | "count" | "sessionId">
    : Omit<T, "senderId">

// TYPE GUARDS

export const isValidRepoMessage = (message: Message): message is RepoMessage =>
  typeof message === "object" &&
  typeof message.type === "string" &&
  typeof message.senderId === "string" &&
  (isSyncMessage(message) ||
    isEphemeralMessage(message) ||
    isRequestMessage(message) ||
    isDocumentUnavailableMessage(message))

// prettier-ignore
export const isDocumentUnavailableMessage = (msg: Message): msg is DocumentUnavailableMessage => 
  msg.type === "doc-unavailable"

export const isRequestMessage = (msg: Message): msg is RequestMessage =>
  msg.type === "request"

export const isSyncMessage = (msg: Message): msg is SyncMessage =>
  msg.type === "sync"

export const isEphemeralMessage = (msg: Message): msg is EphemeralMessage =>
  msg.type === "ephemeral"
