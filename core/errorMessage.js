errorMessage = {
    SUCCESS : {errno: 0, message: 'Success'},
    USER_IS_NULL : {errno: -1, message: 'User is null'},
    USER_MISSING_NAME : {errno: -2, message: 'User is missing first name or last name'},
    USER_MISSING_EMAIL : {errno: -3, message: 'User is missing email'},
    USER_MISSING_PASSWORD : {errno: -4, message: 'User is missing password'},
    USER_ALREADY_EXISTS : {errno: -5, message: 'User already exists'},
    USER_DOES_NOT_EXIST : {errno: -6, message: 'User does not exist'},
    PASSWORD_DOES_NOT_MATCH : {errno: -7, message: 'Password does not match'},
    USER_ALREADY_ADMIN : {errno: -8, message: 'User is already an admin'},
    USER_NOT_ADMIN : {errno: -9, message: 'User is not an admin'},
    INVALID_LIVE_TOKEN : {errno: -10, message: 'Invalid live token'},
    CHARACTER_NOT_EXIST : {errno: -11, message: 'Character does not exist'},
    CHARACTER_ID_NOT_PROVIDED : {errno: -12, message: 'Character id not provided'},
    CHARACTER_DATA_INCOMPLETE : {errno: -13, message: 'Character data is incomplete'},
    CHARACTER_CID_INVALID : {errno: -14, message: 'Character cid is invalid'},
    ACTION_INVALID : {errno: -15, message: 'Action is invalid'},
    INVALID_RECORD_ID : {errno: -16, message: 'Invalid record id'},
    NO_PREMISSION_TO_EXECUTE : {errno: -17, message: 'No permission to execute'},
    ACTION_INVALID : {errno: -18, message: 'Action is invalid'},
    USER_NOT_ADMIN_FOR_THIS_ROOM: {errno: -19, message: 'User is not an admin of this room'},
    CANNOT_DEMOTE_SELF: {errno: -20, message: 'Cannot demote self'},

    ROOM_ALREADY_EXISTS: {errno: -21, message: 'Room already exists'},
    ROOM_DOES_NOT_EXIST: {errno: -22, message: 'Room does not exist'},

    USER_ALREADY_IN_ROOM: {errno: -23, message: 'User is already in room'},

    NO_NEED_TO_UPDATE: {errno: -24, message: 'No need to update'},

    ADMIN_CANNOT_LEAVE_ROOM: {errno: -25, message: 'Admin cannot leave room'},
    USER_NOT_IN_ROOM : {errno: -26, message: 'User is not in room'},
    INVALID_TASK_DATA: {errno: -27, message: 'Invalid task data'},

    TASK_NOT_FOUND: {errno: -28, message: 'Task not found'},
    


    UNKNOWN_ERROR : {errno: -999, message: 'Unknown error, please contact the administrator'}
}

module.exports = {errorMessage};