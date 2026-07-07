export default defineEventHandler(async () => {
  const profiles = await getProfiles()
  // Never expose passwords to the client
  return profiles.map(({ password: _, ...rest }) => rest)
})
