import axios from 'axios'
import { ElMessage } from 'element-plus'
import { saveAs } from 'file-saver'
import { getToken } from '@/utils/auth'
import { blobValidate } from '@/utils/ruoyi'

const baseURL = import.meta.env.VITE_APP_BASE_API

export default {
  zip(url, name) {
    var url = baseURL + url
    axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: { 'Authorization': 'Bearer ' + getToken() }
    }).then(async (res) => {
      const isLogin = await blobValidate(res.data);
      if (isLogin) {
        const blob = new Blob([res.data], { type: 'application/zip' })
        this.saveAs(blob, name)
      } else {
        ElMessage.error('无效的会话，或者会话已过期，请重新登录。');
      }
    })
  },
  saveAs(text, name, opts) {
    saveAs(text, name, opts);
  }
}

