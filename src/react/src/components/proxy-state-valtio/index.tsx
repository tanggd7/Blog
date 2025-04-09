// import { proxy, useSnapshot } from "./valtio"
import { proxy, useSnapshot } from "./valtio.my"

const state = proxy({ count: 100, text: "BFE.dev" })

// setInterval(() => {
//   ++state.count
// }, 1000)

export default function ProxyStateValtioDemo() {
  const snap = useSnapshot(state)
  console.log("%c Line:12 🍿 snap", "background:#33a5ff", snap)
  return (
    <div>
      {snap.text}-{snap.count}
      <button
        onClick={() => {
          ++state.count
        }}
      >
        +1
      </button>
      <button
        onClick={() => {
          state.text = "bigfrontend.dev"
        }}
      >
        text
      </button>
    </div>
  )
}
