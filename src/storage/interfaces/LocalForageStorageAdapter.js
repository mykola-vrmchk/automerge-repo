// Saving & loading
// How should we think about incremental save & load? Log + compaction? TBD.
import localforage from 'localforage'

function LocalForageAdapter() {
  return {
    load: (docId) => localforage.getItem(docId),
    save: (docId, binary) => localforage.setItem(docId, binary),
    remove: (docId) => localforage.removeItem(docId),
  }
}
export default LocalForageAdapter
