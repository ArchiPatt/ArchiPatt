import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class OAuthClient {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "text" })
  clientId!: string;

  @Column({ type: "text", nullable: true })
  clientSecretHash!: string | null;

  @Column({ type: "text", array: true })
  redirectUris!: string[];

  @Column({ type: "text", array: true })
  allowedScopes!: string[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
