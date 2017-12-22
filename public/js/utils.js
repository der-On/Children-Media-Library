function encodePath(path) {
  return encodeURIComponent(path)
  .replace(/'/g, '&apos;')
  .replace(/,/g,'&comma;');
}

function albumColor(album, saturation = 20, lightness = 50) {
  return strToColor(album.artist + album.title, saturation, lightness);
}

function strToColor(str, saturation = 20, lightness = 50) {
  const h = hashCode(str) % 360;
  return `hsl(${h}, ${saturation}%, ${lightness}%)`;
}

albumColor = _.memoize(albumColor, function (album, saturation, lightness) {
  return album.id + saturation + lightness;
});

function hashCode(str) {
  var hash = 0;
  if (str.length == 0) return hash;
  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
