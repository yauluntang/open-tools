import ttfInfo from 'ttfinfo';

export const getTtfInfo = async (ttf) => {
  return new Promise((resolve, reject) => {
    try {
      ttfInfo(ttf, (err, info) => {
        if (!err) {
          const fieldNames = ['copyright', 'fontFamily', 'fontSubFamily', 'fontIdentifier', 'fontName', 'fontVersion', 'postscriptName', 'trademark', 'manufacturer', 'designer', 'description', 'vendorURL', 'designerURL', 'license', 'licenseURL', 'reserved', 'preferredFamily', 'preferredSubFamily', 'compatibleFullName', 'sampleText', 'postScriptCIDfindfontName', 'WWSFamilyName', 'WWSSubFamilyName'];
          info.parsedInfo = {};
          for (let i = 0; i < fieldNames.length; i++) {
            info.parsedInfo[fieldNames[i]] = info.tables.name[i];
          }
          resolve(info)
        }
        reject(err)
      })
    } catch (error) {
      reject(error)
    }
  })

}
