import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "text" })
  username!: string;

  @Column({ type: "text", nullable: true })
  displayName!: string | null;

  @Column({ type: "text", array: true, default: () => "ARRAY[]::text[]" })
  roles!: string[];

  @Column({ type: "boolean", default: false })
  isBlocked!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
