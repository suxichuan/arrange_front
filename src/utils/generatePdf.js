import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

/**
 * 将指定的dom元素转为pdf 并下载
 * @param {element} dom
 * @param {string} filename
 */
export default function (dom, filename) {
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  html2Canvas(dom, {
    allowTaint: true,
    useCORS: true,
    height: dom?.scrollHeight || 1080,
    windowHeight: dom?.scrollHeight || 1080
  }).then(canvas => {
    let contentWidth = canvas.width;
    let contentHeight = canvas.height;
    // 一页pdf显示html页面生成的canvas高度;
    // let pageHeight = contentWidth * 841.89 / 592.28;
    let pageHeight = contentWidth * 800 / 592.28;
    // 未生成pdf的html页面高度
    let leftHeight = contentHeight;
    // 页面偏移
    let position = 0;
    // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
    let imgWidth = 595.28;
    let imgHeight = imgWidth / contentWidth * contentHeight;
    let pageData = canvas.toDataURL('image/jpeg', 1.0);
    let pdf = new JsPDF('', 'pt', 'a4');
    if (leftHeight < pageHeight) {
      pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
    } else {
      while (leftHeight > 0) {
        pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
        leftHeight -= pageHeight;
        position -= 800;
        // 避免添加空白页
        if (leftHeight > 0) {
          pdf.addPage();
        }
      }
    }

    // 下载操作
    filename = filename.indexOf('.pdf') >= 0 ? filename : filename + '.pdf'
    pdf.save(filename);
  })
}
