export default function(len) {
  var s = ''
  while (s.length < len) {
    s += Math.random()
      .toString(16)
      .substring(2)
  }
  return s.substring(0, len)
}
