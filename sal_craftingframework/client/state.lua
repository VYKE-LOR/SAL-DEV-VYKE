local State = {
  open = false,
  token = nil,
  snapshot = nil,
  player = nil,
  bench = nil,
  admin = false,
}

function State.SetOpen(value, token, player, bench, admin)
  State.open = value
  State.token = token
  State.player = player
  State.bench = bench
  State.admin = admin or false
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

function State.IsAdmin()
  return State.admin
end

return State
