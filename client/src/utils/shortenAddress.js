//shortens the address on the card
export const shortenAddress = (address) =>
  `${address.slice(0, 9)}...${address.slice(address.length - 5)}`;
