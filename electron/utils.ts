import SparkMD5 from 'spark-md5';

/**
 * Base64字符串转二进制流
 * @param {String} dataurl Base64字符串(字符串包含Data URI scheme，例如：data:image/png;base64, )
 */
export function dataURLtoArrayBuffer(dataurl:string) {
    if(!/^data:([a-zA-Z0-9\/+]+);base64,(.*)$/.test(dataurl)){
      return new ArrayBuffer();
    }
	let arr = dataurl.split(","),
		mime = arr[0].match(/:(.*?);/)![1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
    const blob = new Blob([u8arr], { type: mime });
	return blob.arrayBuffer()
}
export async function calculateBase64Hash(base64String: string): Promise<string> {
  const blob = await dataURLtoArrayBuffer(base64String);
  // 创建 SparkMD5 实例并计算 hash
  const spark = new SparkMD5.ArrayBuffer();
  spark.append(blob);
  return spark.end();
}
