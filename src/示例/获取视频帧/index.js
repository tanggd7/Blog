const ipt = document.querySelector("input[type=file]")

ipt.onchange = async function (e) {
  const file = e.target.files[0]

  for (let i = 0; i < 10; i++) {
    // 获取每帧的图片信息，{ url, blob }
    const frame = await extractFrame(file, i)
    createPreview(frame)
  }
}

/**
 * 将帧图片加入到 html 中
 * @param {Object} frame 帧图片
 */
function createPreview(frame) {
  const img = document.createElement("img")
  img.src = frame.url
  img.width = 500
  document.body.appendChild(img)
}

/**
 * 生成一个 video ，在等待准备完成后，将 video 时间点的状态绘到 canvas 上
 * @param {File} videoFile 视频文件
 * @param {Number} time 帧时间节点
 * @returns Promise<{url, blob}>
 */
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

/**
 * 将 video 某一时间点绘到 canvas 上，并导出 url 和 blob
 * @param {Video} video
 * @returns Promise<{url, blob}>
 */
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
