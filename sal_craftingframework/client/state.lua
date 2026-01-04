local State = {
  open = false,
  token = nil,
  snapshot = nil,
  player = nil,
  bench = nil,
}

function State.SetOpen(value, token, player, bench)
  State.open = value
  State.token = token
  State.player = player
  State.bench = bench
end

function State.SetSnapshot(snapshot)
  State.snapshot = snapshot
end

function State.GetSnapshot()
  return State.snapshot
end

function State.IsOpen()
  return State.open
end

return State
