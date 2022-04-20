# Back end application for Pawppy

Provides CRUD functionality for the pawppy application and handles the consumption and forwarding of 3rd party APIs.

End Points

1. /user/register - Registers a user to database and authenticates user
2. /user/login - Authenticates user
3. /user/update/name - Updates user name
4. /user/update/phonenumber = Updates phone number
5. /user/update/password - Updates user password
6. /api/v1/favorites GET - Get user favorite pets
7. /api/v1/favorites POST - Add pet to user favorites
8. /api/v1/favorites DELETE - Delete pet from user favorites
9. /api/v1/recentviews GET - Get user recent views
10. /api/v1/recentviews POST - Add animal to user recent views
11. /petfider/animals GET - Get animals
12. /petfinder/animals:id GET - Get particular animal
13. /petfinder/types GET - Get animal types
14. /petfinder/breeds GET - Get animal breeds
15. /petfinder/organizations - Get animal shelters

Database Information

Collections

1. User - Stores user info
2. Favorites - Stores user favorites
3. Token - Stores third party refresh token
