import { pause } from "../../src/helpers/pause.js"
import { Message, NetworkAdapter, PeerId } from "../../src/index.js"

export class DummyNetworkAdapter extends NetworkAdapter {
  #startReady: boolean
  #sendMessage?: SendMessageFn
  #closed: boolean = false

  constructor(opts: Options = { startReady: true }) {
    super()
    this.#startReady = opts.startReady
    this.#sendMessage = opts.sendMessage
  }

  connect(peerId: PeerId) {
    if (this.#closed) {
      return
    }
    this.peerId = peerId
    if (this.#startReady) {
      this.emit("ready", { network: this })
    }
  }

  disconnect() {}

  peerCandidate(peerId: PeerId) {
    if (this.#closed) {
      return
    }
    this.emit("peer-candidate", { peerId, peerMetadata: {} })
  }

  override send(message: Message) {
    if (this.#closed) {
      return
    }
    this.#sendMessage?.(message)
  }

  receive(message: Message) {
    if (this.#closed) {
      return
    }
    this.emit("message", message)
  }

  static createConnectedPair({ latency = 10 }: { latency?: number } = {}) {
    const adapter1: DummyNetworkAdapter = new DummyNetworkAdapter({
      startReady: true,
      sendMessage: (message: Message) =>
        pause(latency).then(() => adapter2.receive(message)),
    })
    const adapter2: DummyNetworkAdapter = new DummyNetworkAdapter({
      startReady: true,
      sendMessage: (message: Message) =>
        pause(latency).then(() => adapter1.receive(message)),
    })

    return [adapter1, adapter2]
  }

  close() {
    this.#closed = true
    this.emit("close")
  }
}

type SendMessageFn = (message: Message) => void

type Options = {
  startReady?: boolean
  sendMessage?: SendMessageFn
}
