const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const Zones = require('../TimeZones.js')
const names = ['Europe/Berlin', 'America/New_York', 'Asia/Tokyo', 'Pacific/Kiritimati', 'Australia/Sydney', 'Australia/Lord_Howe', 'Asia/Kathmandu', 'Africa/Casablanca', 'Europe/Dublin']

// What the clock reads at each instant, according to the C library reading the
// same zone file. Node's Intl is no reference: ICU carries its own copy of the
// time zone database, which lags or leads the system's. tzdata 2026c moved
// Morocco to permanent UTC from 2026-09-20, and a Node whose ICU predates that
// still puts Casablanca an hour ahead.
function systemWalls(name, instants) {
  const out = execFileSync('date', ['-f', '-', '+%Y-%m-%d %H:%M'], {
    input: instants.map(instant => `@${instant / 1000}\n`).join(''),
    env: { ...process.env, TZ: name, LC_ALL: 'C' },
  })
  return String(out).trim().split('\n').map(line => {
    const [date, clock] = line.split(' ')
    return { date, clock }
  })
}

let cases = 0
for (const name of names) {
  const zone = Zones.parse(fs.readFileSync(Zones.zonePath(name)))
  assert.ok(zone, name)
  const instants = []
  for (const year of [2026, 2027, 2040, 2100]) {
    for (let month = 0; month < 12; month++) instants.push(Date.UTC(year, month, 15, 12, 34))
  }
  const expected = systemWalls(name, instants)
  assert.equal(expected.length, instants.length, name)
  instants.forEach((instant, index) => {
    const label = `${name} ${new Date(instant).toISOString()}`
    const wall = zone.wall(instant)
    assert.equal(wall.date, expected[index].date, label)
    assert.equal(wall.clock, expected[index].clock, label)
    assert.equal(zone.place(wall.date, wall.clock), instant, label)
    cases++
  })
}
const berlin = Zones.parse(fs.readFileSync(Zones.zonePath('Europe/Berlin')))
assert.equal(new Date(berlin.place('2027-03-28', '02:30')).toISOString(), '2027-03-28T01:30:00.000Z')
assert.equal(new Date(berlin.place('2027-10-31', '02:30')).toISOString(), '2027-10-31T00:30:00.000Z')
assert.equal(Zones.parse(new Uint8Array([1, 2, 3])), null)
for (const name of ['../secret', 'Europe/../../secret', '/etc/passwd', 'right/UTC', 'localtime', 'Local']) assert.equal(Zones.zonePath(name), '')
console.log(`ok time zones [${process.env.TZ || 'local'}]: ${cases} round trips`)
