export type CreateCustomerDTO = {
  username: string;
  email: string;
  name: string;
};

export type CustomerDB = CreateCustomerDTO & {
  enabled: boolean;
};

export type CustomerListDB = {
  total: number;
  items: CustomerDB[];
};
