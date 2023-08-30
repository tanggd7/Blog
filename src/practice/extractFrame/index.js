const ipt = document.querySelector("input[type=file]")

ipt.onchange = async function (e) {
  const file = e.target.files[0]

  for (let i = 0; i < 10; i++) {
    const frame = await extractFrame(file, i)
    createPreview(frame)
  }
}

function createPreview(frame) {
  const img = document.createElement("img")
  img.src = frame.url
  img.width = 500
  document.body.appendChild(img)
}

function extractFrame(videoFile, time = 0) {
  return new Promise(function (resolve) {
    const video = document.createElement("video")
    video.currentTime = time
    video.autoplay = true
    video.muted = true
    video.src = URL.createObjectURL(videoFile)
    video.oncanplay = async function () {
      const frame = draw(video)
      resolve(frame)
    }
  })
}

function draw(video) {
  return new Promise(function (resolve) {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(function (blob) {
      resolve({
        blob,
        url: URL.createObjectURL(blob),
      })
    })
  })
}
