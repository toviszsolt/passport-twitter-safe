export function parseProfile(json) {
  if (typeof json === 'string') json = JSON.parse(json);
  const profile = {};
  profile.id = json.id_str || String(json.id);
  profile.username = json.screen_name;
  profile.displayName = json.name;
  if (json.email) profile.emails = [{ value: json.email }];
  if (json.profile_image_url_https) profile.photos = [{ value: json.profile_image_url_https }];
  return profile;
}
