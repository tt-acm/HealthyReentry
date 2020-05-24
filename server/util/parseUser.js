

/*

Update this method to expose user email id for the application.
The application relies on user's email id to perform checks.
You can update this method to parse user object received via sso
and expose their email address under the key `email`.

The additional fields of `name`, `picture` and `location` are used
in other parts of application for display and grouping but are not
essential for its functioning

{
  "email": "<EMAIL_ADDR_TO_NOTIFY_USER>",
  "name": "<NAME_AS_DISPLAYED_IN_LISTS>",
  "location": "<USER_PHYSICAL_LOCATION>",
  "picture": "<PATH_OF_IMAGE_FOR_PROFILE>",
}

Returning an object without an email will stop the user from
registering for the application.

*/
function parseUser(ssoUser) {
  return ssoUser
}


module.exports = parseUser;