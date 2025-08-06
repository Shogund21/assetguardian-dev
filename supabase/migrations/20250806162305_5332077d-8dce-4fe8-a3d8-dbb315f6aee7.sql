-- Create function to delete HVAC diagnostic session (super admin only)
CREATE OR REPLACE FUNCTION public.delete_hvac_session(p_session_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_session_count INTEGER;
    deleted_messages_count INTEGER;
    session_info RECORD;
BEGIN
    -- Check if current user is super admin
    IF NOT public.is_super_admin() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Access denied: Super admin privileges required'
        );
    END IF;
    
    -- Get session info for audit logging
    SELECT equipment_id, user_id, started_at, ended_at 
    INTO session_info
    FROM public.hvac_diag_sessions 
    WHERE id = p_session_id;
    
    IF session_info IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Session not found'
        );
    END IF;
    
    -- Delete associated messages first
    DELETE FROM public.hvac_diag_messages 
    WHERE session_id = p_session_id;
    GET DIAGNOSTICS deleted_messages_count = ROW_COUNT;
    
    -- Delete the session
    DELETE FROM public.hvac_diag_sessions 
    WHERE id = p_session_id;
    GET DIAGNOSTICS deleted_session_count = ROW_COUNT;
    
    -- Log the deletion for audit trail
    PERFORM public.log_audit_event(
        'DELETE',
        'hvac_diag_sessions',
        p_session_id,
        json_build_object(
            'equipment_id', session_info.equipment_id,
            'user_id', session_info.user_id,
            'started_at', session_info.started_at,
            'ended_at', session_info.ended_at,
            'deleted_messages_count', deleted_messages_count
        )::jsonb,
        null,
        'HVAC diagnostic session deleted by super admin'
    );
    
    RETURN json_build_object(
        'success', true,
        'deleted_session_count', deleted_session_count,
        'deleted_messages_count', deleted_messages_count,
        'message', 'Session and associated messages deleted successfully'
    );
END;
$$;