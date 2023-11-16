export type CreateCustomerDTO = {
  username: string;
  email: string;
  name: string;
};

export type CustomerDB = CreateCustomerDTO & {
  uuid: string;
  enabled: boolean;
};

export type CustomerListDB = {
  total: number;
  items: CustomerDB[];
};
