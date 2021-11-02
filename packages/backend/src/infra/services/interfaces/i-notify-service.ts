export interface INotifyservice {
  sendSMS(phone: string, message: string): Promise<boolean>;
  sendLineText(id: string, message: string): Promise<boolean>;
}
