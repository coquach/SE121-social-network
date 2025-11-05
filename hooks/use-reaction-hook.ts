import {
  disReact,
  getReactions,
  GetReactionsDto,
  react,
} from '@/lib/actions/social/reaction/reaction-action';
import { CursorPageResponse } from '@/lib/cursor-pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import {
  CreateReactionForm,
  DisReactionForm,
  ReactionDTO,
} from '@/models/social/reaction/reactionDTO';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetReactions = (query: GetReactionsDto) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<ReactionDTO>>({
    queryKey: ['reactions', query.targetId, query.targetType, query.reactionType],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getReactions(token, {
        ...query,
        cursor: pageParam,
      } as GetReactionsDto);
    },
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    staleTime: 0,
    enabled: !!query.targetId,
  });
};

export const useReact = (targetId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateReactionForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await react(token, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', targetId] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDisReact = (targetId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (dto: DisReactionForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await disReact(token, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', targetId] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
