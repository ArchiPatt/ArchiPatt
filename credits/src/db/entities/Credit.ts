import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

export type CreditStatus = "active" | "closed" | "defaulted";

@Entity()
export class Credit {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  clientId!: string;

  @Column({ type: "uuid" })
  accountId!: string;

  @Column({ type: "uuid" })
  tariffId!: string;

  @Column({ type: "numeric", precision: 18, scale: 2 })
  principalAmount!: string;

  @Column({ type: "numeric", precision: 18, scale: 2 })
  outstandingAmount!: string;

  @Column({ type: "text", default: "active" })
  status!: CreditStatus;

  @Column({ type: "timestamptz" })
  issuedAt!: Date;

  @Column({ type: "timestamptz" })
  nextPaymentDueAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  closedAt!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
