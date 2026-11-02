/** Code samples drawn with each theme's token colours. Roles: see ROLE_CLASS. */
export type Tok = [role: string, text: string];
export type Line = Tok[];

export const SQL: Line[] = [
  [["c", "-- Top customers by lifetime revenue"]],
  [],
  [["k", "WITH "], ["v", "revenue "], ["k", "AS "], ["pun", "("]],
  [["pun", "  "], ["k", "SELECT "], ["p", "customer_id"], ["pun", ", "], ["f", "SUM"], ["pun", "("], ["p", "amount"], ["pun", ") "], ["k", "AS "], ["p", "total"]],
  [["pun", "  "], ["k", "FROM "], ["t", "orders"]],
  [["pun", "  "], ["k", "WHERE "], ["p", "status"], ["o", " = "], ["s", "'paid'"]],
  [["pun", "  "], ["k", "GROUP BY "], ["p", "customer_id"]],
  [["pun", ")"]],
  [["k", "SELECT "], ["v", "c"], ["pun", "."], ["p", "name"], ["pun", ", "], ["v", "r"], ["pun", "."], ["p", "total"], ["pun", ", "], ["v", "c"], ["pun", "."], ["p", "created_at"]],
  [["k", "FROM "], ["t", "customers "], ["k", "AS "], ["v", "c"]],
  [["k", "JOIN "], ["t", "revenue "], ["k", "AS "], ["v", "r"], ["k", " ON "], ["v", "r"], ["pun", "."], ["p", "customer_id"], ["o", " = "], ["v", "c"], ["pun", "."], ["p", "id"]],
  [["k", "WHERE "], ["v", "r"], ["pun", "."], ["p", "total"], ["o", " > "], ["n", "1000"]],
  [["k", "ORDER BY "], ["v", "r"], ["pun", "."], ["p", "total"], ["k", " DESC"]],
  [["k", "LIMIT "], ["n", "10"], ["pun", ";"]],
];

export const TS: Line[] = [
  [["k", "import "], ["pun", "{ "], ["v", "db"], ["pun", " } "], ["k", "from "], ["s", '"./client"'], ["pun", ";"]],
  [],
  [["k", "export async function "], ["f", "topCustomers"], ["pun", "("], ["pa", "min"], ["o", " = "], ["n", "1000"], ["pun", ") {"]],
  [["pun", "  "], ["k", "const "], ["v", "rows"], ["o", " = "], ["k", "await "], ["v", "db"], ["pun", "."], ["f", "query"], ["o", "<"], ["t", "Customer"], ["o", ">"], ["pun", "("]],
  [["pun", "    "], ["f", "sql"], ["s", "`SELECT name, total"]],
  [["s", "       FROM revenue WHERE total > "], ["pun", "${"], ["pa", "min"], ["pun", "}`"], ["pun", ");"]],
  [["pun", "  "], ["k", "return "], ["v", "rows"], ["pun", "."], ["f", "filter"], ["pun", "("], ["pa", "r"], ["o", " => "], ["pa", "r"], ["pun", "."], ["p", "total"], ["o", " > "], ["n", "0"], ["pun", ");"]],
  [["pun", "}"]],
];

export const MINI: Line[] = [
  [["k", "SELECT "], ["p", "name"], ["pun", ", "], ["p", "total"]],
  [["k", "FROM "], ["t", "revenue"]],
  [["k", "WHERE "], ["p", "total"], ["o", " > "], ["n", "1000"]],
  [["k", "ORDER BY "], ["p", "total"], ["k", " DESC"]],
];
