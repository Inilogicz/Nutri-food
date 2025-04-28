export {};

declare global {
  interface Window {
    FlutterwaveCheckout: (paymentData: any) => void;
  }
}