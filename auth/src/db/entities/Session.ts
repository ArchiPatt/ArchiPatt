import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "text" })
  sessionId!: string;

  @Index()
  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "text" })
  username!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
