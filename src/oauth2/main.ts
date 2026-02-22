// OAUTH 2.0
// ROLES

// resource owner - an entity capable of gratnting access to a protected resource
// resource server- server hosting protected resourcers, gives resources based on access token
// client - application making request for protected rresource behave of resource owner (often end user)
// authorization server - the server issuing access tokens to the client, after successfully authenticating the resource owner and obtaning authorization


// Authorization server and resource server may be the same server or separate entity.
// Authorization server only knows "who" its job is to answer one question "is this client allowed to act on behalf of this user?", it validates identity and issues a token. but it has no idead what your data actually look like.
// Resource


// E.g sign in with google
// role                     who                                               what they hold   
// resource owner -         you                                               your google acccount data (email, name, profile picture)
// authorization server     (google's auth system)account.google.com          your credentials and ability to issue a token
// resource owner           (google's api) peopel.googleapis.com              protected data (profile info, contacts)
// client                   your website                                      nothing, they ask for data


// You (browser)       Some website      Google Auth Server       Google API (Resource Server)
//      |                    |                        |                          |
//      |--click "Sign in"-->|                        |                          |
//      |                    |---redirect (A)-------->|                          |
//      |<---redirect to accounts.google.com ---------|                          |
//      |---login + consent (A/B)-------------------->|                          |
//      |<---redirect back to Spotify with code (B)---|                          |
//      |                    |---auth code (C)------->|                          |
//      |                    |<---access token (D)----|                          |
//      |                    |---access token (E)----------------------------->  |
//      |                    |<---your profile data (F)------------------------- |

// google acts as proxt for your consents instead website asking directly "give me your google password" google does, which would be attack vendor.


//  +--------+                               +---------------+
//  |        |--(A)- Authorization Request ->|   Resource    |
//  |        |                               |     Owner     |
//  |        |<-(B)-- Authorization Grant ---|               |
//  |        |                               +---------------+
//  |        |
//  |        |                               +---------------+
//  |        |--(C)-- Authorization Grant -->| Authorization |
//  | Client |                               |     Server    |
//  |        |<-(D)----- Access Token -------|               |
//  |        |                               +---------------+
//  |        |
//  |        |                               +---------------+
//  |        |--(E)----- Access Token ------>|    Resource   |
//  |        |                               |     Server    |
//  |        |<-(F)--- Protected Resource ---|               |
//  +--------+                               +---------------+


// A. The client requests authroization from the resource owner. The authorization request can be made directly to the resouce owner or preferably indirectly via the authorization server as intermediary
// B. the clients recives an authorization grant, which is a credential represneting the resource owner's authorization, expressed using one of four gran type defined in this specification or using an extension grant type. The authorization grant type depends on the method userd by client to request authorization and the types supported by the authorization server.
// C. The client requests an access token by authenticating with the authorzation server and prsneting the authorization grant
// D. The authorization server authenticated the client adn validates the authorization grant, and if valid, issues and access token
// E the client requests the protected resources from the resource server and authenticates by presentign the access token.
// F yhe resource server validates the access token, and if valid, serves the request.

//   The preferred method for the client to obtain an authorization grant
//    from the resource owner (depicted in steps (A) and (B)) is to use the
//    authorization server as an intermediary


// grant types:
// 1. Authorization code (recommended)
// 2. implicit (deprecated)
// 3. Resoucer owner password credentials ()
// 4. client credentials -> client id + secret
// There us extensibility mechanism for dsefinign additonal types

// Grant Type	                User involved?	Client sees password?	          Use case
// Authorization Code	            ✅	                ❌	                Web app with backend
// Authorization Code + PKCE	    ✅	                ❌	                SPA / mobile app
// Implicit	                        ✅	                ❌	                Deprecated — don't use
// ROPC	                            ✅	                ✅	                Legacy only
// Client Credentials	           ❌	                n/a	                 Service-to-service


// 1. Authorization code
// The authorization code is obtained by using an authorization server as an intermediary between client and resource owner. Instead of requesting authorization directly from the resource owner, the client direct the resource owner to authorization server (via its user agent) which turns directs the resource owner back to the client with authorization code (e.g login via google).

// Before redirecting the resource owner back to the clioent with authorization code, the authorization server authenticates the resource owner and obtains authorization. Becasue the resource owner oinly authenticates with the authrization server, the resource owner's crednetials are never shared WITH THE CLIENT! (that is important why we delagte it to authorization server to acts and intermediary)

// The authorization code provvides a few important security benefits, such as the ability to authenticate the client, as well as the tramission of the access token directly to the client without passing it thourgh the resource owner's user agent and potentially exposing ti to others, including the resource owner

// 2. Implicint
// simplify authorization optimized for clients implemented in browser. In the implicit flow, instead of issuing the client an authorization code, the client is issued and access token directly. When issuing an access token during the implcing grant flow, the authorization server doesn not authenticate the client. In some cases, the client identify can be verified via the redirection URI used to delikver the access token to client. The access token mybe expoed to the resource owner ot other appplicationbwith access to resource owner's user agent (basically, someone can steal this access token more easily, compared to authorization code, authorization code its exchanged by client this code is assigned to making it useless for other people that would steal it).
// It has less round trip but needs to be weighted against security implications.

// 3. Resource owner password credentials
// Resource owner passses password crententials (e.g username, password) to obtains access token, this should be used only when there is high degree of trsut beteween resource owne and client 

// 4. client crednetials
// The lceint crendetials (or other forms of client authentication) can be used as an authorization grant when the authorization scope is limited to the protected resources under the control of the client or to protected resources previously arrenged with the authorization server.
// (another way speking something is on your infra, e.g microservices one of the microservices need to access data but needs to somehow be verified that it is who it says it is)
// Previously arranged with the authorization server - the resources dont belong to the client, byt some out of band agreemtnt was made in advance e.g a data nalytics comapny get permission from your commpany to pull your sels data every night via a cron job.
// client credentials are used as an authorization grant ypicall when the client is acting on its own behals (the client is also the resource owner) or iss requesting access to protecte resources based on an authrotization previously arranged with the authorization server.

// Refresh token

//   +--------+                                           +---------------+
//   |        |--(A)------- Authorization Grant --------->|               |
//   |        |                                           |               |
//   |        |<-(B)----------- Access Token -------------|               |
//   |        |               & Refresh Token             |               |
//   |        |                                           |               |
//   |        |                            +----------+   |               |
//   |        |--(C)---- Access Token ---->|          |   |               |
//   |        |                            |          |   |               |
//   |        |<-(D)- Protected Resource --| Resource |   | Authorization |
//   | Client |                            |  Server  |   |     Server    |
//   |        |--(E)---- Access Token ---->|          |   |               |
//   |        |                            |          |   |               |
//   |        |<-(F)- Invalid Token Error -|          |   |               |
//   |        |                            +----------+   |               |
//   |        |                                           |               |
//   |        |--(G)----------- Refresh Token ----------->|               |
//   |        |                                           |               |
//   |        |<-(H)----------- Access Token -------------|               |
//   +--------+           & Optional Refresh Token        +---------------+

//                Figure 2: Refreshing an Expired Access Token



// Client types

// confidential - clients capable of maintaing the confidentiality of their credentials (e.g client on the server)

// public - Clients inacpable of maintaining the confidentiality of their credentials (e.g clients on thedevices used be resource owner)

// web application i a confidential client running on a web server. Clients credentials are store on web server and are not exposed or accessible by the resource owner.
// user agent base application is a public client
// native application is a public client. Only dynamicall issuded credential sucha sa acess token or refresh tokens can recive an acceptable leve of protcetion.

//Protocol endpoints:
// Authorization endpoint - used by the client to obtain authrozation from t he resource owner via user-agent redierction.
// Token endpoint - used by the client to exchange authorization grant for  an access token, typically with the client authentication.
// Redirection endpoint- used by the authorization server to return responses containing authorization credetnials to the client via the resource owner user-agent.

// Extension may defined additional endp;oints as needed.



// Authroization code grant


{    //  +----------+
//  | Resource |
//  |   Owner  |
//  |          |
//  +----------+
//       ^
//       |
//      (B)
//  +----|-----+          Client Identifier      +---------------+
//  |         -+----(A)-- & Redirection URI ---->|               |
//  |  User-   |                                 | Authorization |
//  |  Agent  -+----(B)-- User authenticates --->|     Server    |
//  |          |                                 |               |
//  |         -+----(C)-- Authorization Code ---<|               |
//  +-|----|---+                                 +---------------+
//    |    |                                         ^      v
//   (A)  (C)                                        |      |
//    |    |                                         |      |
//    ^    v                                         |      |
//  +---------+                                      |      |
//  |         |>---(D)-- Authorization Code ---------'      |
//  |  Client |          & Redirection URI                  |
//  |         |                                             |
//  |         |<---(E)----- Access Token -------------------'
//  +---------+       (w/ Optional Refresh Token)}

