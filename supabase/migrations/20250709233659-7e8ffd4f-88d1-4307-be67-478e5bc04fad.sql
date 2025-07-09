
-- Create enhanced function for technician status management with proper security
CREATE OR REPLACE FUNCTION public.set_technician_status(
    p_technician_id   uuid,
    p_new_status      text,
    p_account_status  text DEFAULT NULL,
    p_user_enabled    boolean DEFAULT NULL
)
RETURNS void
VOLATILE                           
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Update technician status and get user_id
    UPDATE public.technicians
      SET status         = COALESCE(p_new_status, status),
          account_status = COALESCE(p_account_status, account_status),
          "updatedAt"    = now()
      WHERE id = p_technician_id
      RETURNING user_id INTO v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Technician % not found', p_technician_id;
    END IF;

    -- Update auth.users metadata if user_enabled is specified
    IF p_user_enabled IS NOT NULL AND v_user_id IS NOT NULL THEN
        UPDATE auth.users
           SET raw_app_meta_data =
                 COALESCE(raw_app_meta_data,'{}'::jsonb)
                 || jsonb_build_object('disabled', NOT p_user_enabled)
         WHERE id = v_user_id;
    END IF;

    -- Log the action in audit_logs
    INSERT INTO public.audit_logs (
        user_id, action, table_name, record_id,
        new_values, metadata
    )
    VALUES (
        auth.uid(),
        'technician_status_update',
        'technicians',
        p_technician_id,
        jsonb_build_object(
            'status',         p_new_status,
            'account_status', p_account_status,
            'user_enabled',   p_user_enabled
        ),
        jsonb_build_object(
            'updated_by', 'set_technician_status_function',
            'timestamp',  now()
        )
    );
END;
$$;

-- Grant execute permissions with explicit parameter list
GRANT EXECUTE ON FUNCTION public.set_technician_status(uuid,text,text,boolean)
  TO authenticated, service_role;
