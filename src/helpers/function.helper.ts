export function formatMongoId(data: any) {
  data.id = data._id;
  delete data._id;
  return data;
}

export function listToObject(data: any[]) {
  return data.map((item) => item.toObject());
}

export function splitArray(arr: any[], length: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += length) {
    result.push(arr.slice(i, i + length));
  }
  return result;
}

export function createNumberArray(length: number) {
  return Array.from({ length }, (_, i) => i);
}


export default function slugify(str: string) {
  str = str.replace(/^\s+|\s+$/g, "");
  str = str.toLowerCase();

  var from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ·/_,:;";
  var to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd------";
  for (var i = 0; i < from.length; i++) {
      str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  return str;
}