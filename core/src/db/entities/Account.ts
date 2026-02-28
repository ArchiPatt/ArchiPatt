import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountStatus } from "../enums/AccountStatus";

@Entity()
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  clientId!: string;

  @Column({ type: "numeric", precision: 18, scale: 2, default: "0" })
  balance!: string;

  @Column({ type: "text", default: AccountStatus.Open })
  status!: AccountStatus;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
