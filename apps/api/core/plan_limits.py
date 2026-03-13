from fastapi import Depends, HTTPException, status
from typing import Callable, Dict, Any

# Assume these helper functions exist or will be created
# In a real app, these would fetch auth context and plan details
async def get_current_organization_plan() -> Dict[str, Any]:
    # This is a placeholder. In a real app, this would fetch the plan details
    # for the authenticated organization from the database or session.
    # For now, let's assume a mock plan:
    return {
        "name": "pro",  # 'free', 'pro', 'agency'
        "limits": {
            "use_cases": -1,
            "documents": -1,
            "managed_orgs": 1,
            "ai_check_exports": -1
        },
        "upgrade_url": "/billing?plan=agency" # Placeholder URL
    }

def check_limit(resource: str):
    def decorator(func: Callable):
        async def wrapper(*args, **kwargs):
            organization_plan = await get_current_organization_plan()
            plan_limits = organization_plan.get("limits", {})
            limit = plan_limits.get(resource)

            if limit is not None and limit != -1:
                # Here, we'd need to check the current usage of the resource
                # This requires having access to the current resource count,
                # which depends on the specific endpoint being decorated.
                # For this example, let's simulate exceeding a limit for 'use_cases'
                # and 'documents' to test the 402 response.
                current_usage = 0 # Placeholder for actual usage

                if resource == 'use_cases' and current_usage >= limit:
                     raise HTTPException(
                        status_code=status.HTTP_402_PAYMENT_REQUIRED,
                        detail={
                            "message": f"Limit exceeded for resource: {resource}",
                            "upgrade_url": organization_plan.get("upgrade_url")
                        }
                    )
                if resource == 'documents' and current_usage >= limit:
                     raise HTTPException(
                        status_code=status.HTTP_402_PAYMENT_REQUIRED,
                        detail={
                            "message": f"Limit exceeded for resource: {resource}",
                            "upgrade_url": organization_plan.get("upgrade_url")
                        }
                    )
                # Add checks for other resources like 'agency_clients' if necessary

            return await func(*args, **kwargs)
        return wrapper
    return decorator
