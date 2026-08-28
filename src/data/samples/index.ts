import { nda } from "./nda";
import { offerLetter } from "./offer-letter";
import { trainingAgreement } from "./training-agreement";

export type SampleContractId = "offer-letter" | "training-agreement" | "nda";

export interface SampleContract {
  id: SampleContractId;
  title: string;
  cardTitle: string;
  blurb: string;
  text: string;
}

export const sampleContracts: SampleContract[] = [offerLetter, trainingAgreement, nda];
