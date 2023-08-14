import jipDataSource from '~/app-data-source';
import { BookInfo, Reviews } from '~/entity/entities';

export const reviewsRepo = jipDataSource.getRepository(Reviews);
export const bookInfoRepo = jipDataSource.getRepository(BookInfo);

type ToggleReviewArgs = {
  reviewsId: number;
  userId: number;
  disabled: boolean;
};
export const toggleReviewVisibilityById = async ({
  reviewsId,
  userId,
  disabled,
}: ToggleReviewArgs) =>
  reviewsRepo.update(reviewsId, {
    disabled: !disabled,
    disabledUserId: disabled ? null : userId,
  });

export const findDisabledReviewById = ({
  id,
}: {
  id: number;
}): Promise<Pick<Reviews, 'disabled' | 'disabledUserId'> | null> =>
  reviewsRepo.findOne({
    select: { disabled: true, disabledUserId: true },
    where: { id },
  });
type RemoveReviewById = { reviewsId: number; deleteUserId: number };
export const removeReviewById = async ({
  reviewsId,
  deleteUserId,
}: RemoveReviewById) =>
  reviewsRepo.update(reviewsId, { deleteUserId, isDeleted: true });
