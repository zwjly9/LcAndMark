var oddEvenList = function(head) {
  if(head === null) {
    return head;
  }
  let odd = head
  let even = head.next
  let evenHead = even
  while(even && even.next) {
    odd.next = temp.next
    odd = odd.next
    even.next = odd.next
    even = even.next
  }
  odd.next = evenHead
  return head
};