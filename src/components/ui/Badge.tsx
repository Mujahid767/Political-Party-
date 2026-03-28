const map: Record<string,string> = {
  OPEN:'gold', PASSED:'green', REJECTED:'red', CLOSED:'gray',
  PENDING:'gold', UNDER_REVIEW:'blue', RESOLVED:'green',
  REPORTED:'red', VERIFIED_TRUE:'purple', VERIFIED_FALSE:'gray', PUBLISHED:'green',
  DONATION:'green', EXPENSE:'red',
  SCHEDULED:'blue', COMPLETED:'green', CANCELLED:'gray',
  ADMIN:'purple', CHAIRMAN:'gold', MINISTER:'blue', MP:'cyan', PUBLIC:'gray',
};
export default function Badge({ status }: { status: string }) {
  const color = map[status] ?? 'gray';
  return <span className={`badge badge-${color}`}>{status.replace(/_/g,' ')}</span>;
}
