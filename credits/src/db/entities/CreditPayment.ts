import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

export type CreditPaymentType = "issue" | "repayment" | "accrual";

@Entity()
export class CreditPayment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  creditId!: string;

  @Column({ type: "numeric", precision: 18, scale: 2 })
  amount!: string;

  @Column({ type: "text" })
  paymentType!: CreditPaymentType;

  @Column({ type: "text" })
  performedBy!: string;

  @Column({ type: "timestamptz" })
  performedAt!: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
