export type CustomerDTO = {
  email: string;
  name: string;
};

export type CustomerDB = CustomerDTO & {
  enabled: boolean;
};
