
export interface CustodianColumn {
  key: string;
  label: string;
}

export const custodiansColumns: CustodianColumn[] = [
  {
    key: "serial",
    label: "S.NO",
  },
  {
    key: "category",
    label: "CATEGORY",
  },
  {
    key: "subject",
    label: "LITIGATION SUBJECT MATTER",
  },
  {
    key: "officer",
    label: "CUSTODIAN OFFICER (STAFF)",
  },
  {
    key: "designation",
    label: "OFFICIAL DESIGNATION",
  },
  {
    key: "actions",
    label: "ACTION",
  },
];
