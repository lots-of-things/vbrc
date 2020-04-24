# virtual black rock city


# backend
There is no real backend with a database. All data is just stored on the player side.
If a player does not move for more than a second, the client will receive a "ping" upon which they should send their entire data.
If the player just moves normally, they should also send their information which will be forwarded to other players. Thus, the timeout will be reset.
The only datapoint which is checked is the player id. Everything else is forwarded verbatim.