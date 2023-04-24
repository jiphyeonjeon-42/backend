import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { SuperTag } from "./SuperTag";

@Index("userid", ["userid"], {})
@Index("superTagId", ["superTagId"], {})
@Entity("sub_tag", { schema: "jip_dev" })
export class SubTag {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "userid" })
  userid: number;

  @Column("int", { name: "superTagId" })
  superTagId: number;

  @Column("datetime", {
    name: "createdAt",
    default: () => "'current_timestamp(6)'",
  })
  createdAt: Date;

  @Column("datetime", {
    name: "updatedAt",
    default: () => "'current_timestamp(6)'",
  })
  updatedAt: Date;

  @Column("tinyint", { name: "isDeleted", default: () => "'0'" })
  isDeleted: number;

  @Column("int", { name: "updateUserId" })
  updateUserId: number;

  @Column("varchar", { name: "content", length: 42 })
  content: string;

  @Column("tinyint", { name: "isPublic" })
  isPublic: number;

  @ManyToOne(() => User, (user) => user.subTags, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "userid", referencedColumnName: "id" }])
  user: User;

  @ManyToOne(() => SuperTag, (superTag) => superTag.subTags, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "superTagId", referencedColumnName: "id" }])
  superTag: SuperTag;
}
