export const enum Route {
    base= "/",
    notfound="/404",

    login = "/login",
    register = "/register",
    resetPassword = "/reset",
    invite = "/invites",

    account = "/account",
    manageMyAccount = "/account/manage/me",

    chat = "/chat",
    manageChannels = "/chat/manage",

    activity = "/activity",
    manageActivity = "/activity/manage",
    manageMyActivity = "/activity/manage/me",

    publications = "/publications",
    managePublications = "/publications/manage",
    manageMyPublications = "/publications/manage/me",

    troc = "/trocs",
    manageTrocs = "/trocs/manage",
    manageMyTrocs = "/trocs/manage/me",

    user = "/users",
    manageUser = "/users/manage",

    friends = "/friends",
    friendsRequest = "/friends/request",
}