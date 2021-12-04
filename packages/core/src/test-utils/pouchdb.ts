import PouchDB from 'pouchdb'

import findPlugin from 'pouchdb-find'
import memoryAdapter from 'pouchdb-adapter-memory'
import { DBDoc } from '..'

PouchDB.plugin(findPlugin)
PouchDB.plugin(memoryAdapter)

export const createPouchDB = async (dbName?: string) => {
  const pouch = new PouchDB<DBDoc>(dbName ?? `test-${Date.now()}`, { adapter: 'memory' })
  await pouch.createIndex({
    index: { fields: ['aggregateName'] },
  })
  await pouch.createIndex({
    index: { fields: ['aggregateType'] },
  })
  await pouch.createIndex({
    index: { fields: ['eventType'] },
  })
  await pouch.createIndex({
    index: { fields: ['aggregateName', 'eventType'] },
  })
  await pouch.createIndex({
    index: { fields: ['aggregateType', 'eventType'] },
  })
  await pouch.createIndex({
    index: { fields: ['aggregateType', 'aggregateId'] },
  })

  return pouch
}

export const dumpPouchDB = async (pouch: PouchDB.Database) => {
  return await pouch.allDocs()
}
