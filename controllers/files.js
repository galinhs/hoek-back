import axios from 'axios'
import path from 'path'
import fs from 'fs'

// 若想要同時抓 FTP 跟本地的檔案可以寫判斷先檢查本地檔案在不在，在就送出去，不在就去 FTP 抓檔案
export const getFile = async (req, res) => {
  if (process.env.FTP === 'true') {
    // 重新將請求導向到主機
    // 因為主機沒有 https，用此方法的話你放在 github pages 的網頁請求圖片時會被擋或404
    // res.redirect(`http://${process.env.FTP_HOST}/${process.env.FTP_USER}/${req.params.file}`)
    try {
      // 從主機取得圖片後，再回傳
      const imgres = await axios({
        method: 'GET',
        url: `http://${process.env.FTP_HOST}/${process.env.FTP_USER}/${req.params.file}`,
        responseType: 'stream'
      })
      imgres.data.pipe(res)
    } catch (error) {
      res.status(404).send({ success: false, message: '雲端找不到' })
    }
  } else {
    // 將使用者傳入的檔名，串成 upload 資料夾的完整路徑
    const filepath = path.join(process.cwd(), 'upload', req.params.file)
    // 檢查檔案在不在
    if (!fs.existsSync(filepath)) {
      res.status(404).send({ success: false, message: '電腦找不到' })
    } else {
      // sendFile 將檔案回傳，只支援絕對路徑
      res.status(200).sendFile(filepath)
    }
  }
}
