export enum Permission {
    QuestionViewToday = 1 << 0,
    QuestionViewAll = 1 << 1,
    QuestionSet = 1 << 2,
    QuestionEdit = 1 << 3,
    QuestionDelete = 1 << 4,
    DataViewTenant = 1 << 5,
    DataViewAll = 1 << 6,
}