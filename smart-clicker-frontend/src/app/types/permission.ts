export enum Permission {
    QuestionView = 1 << 0,
    QuestionCreate = 1 << 1,
    QuestionUpdate = 1 << 2,
    QuestionDelete = 1 << 3,
    DataView = 1 << 4,
    RolesView = 1 << 5,
    RolesCreate = 1 << 6,
    RolesUpdate = 1 << 7,
    RolesAssign = 1 << 8,
    OfficeView = 1 << 9,
    OfficeCreate = 1 << 10,
    OfficeUpdate = 1 << 11,
    // total = 4095
}